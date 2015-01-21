/*

Copyright (C) 2014 - Gareth Edwards / Rapid Information Systems

gareth.edwards@rapid-is.co.uk


This file is part of the Rapid Application Platform

RapidSOA is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version. The terms require you to include
the original copyright, and the license notice in all redistributions.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
in a file named "COPYING".  If not, see <http://www.gnu.org/licenses/>.

*/

package com.rapid.server;

/*

This class wraps HttpServlet and provides a number of useful functions
Mostly getters that retrieve from the servlet context

 */

import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.Constructor;
import java.text.SimpleDateFormat;
import java.util.HashMap;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletResponse;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;
import javax.xml.bind.ValidationEvent;
import javax.xml.bind.ValidationEventHandler;

import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.rapid.core.Applications;
import com.rapid.core.Device.Devices;
import com.rapid.utils.JAXB;
import com.rapid.utils.JAXB.EncryptedXmlAdapter;

@SuppressWarnings({"serial", "unchecked", "rawtypes"})
public class RapidHttpServlet extends HttpServlet {
	
	// private static variables
	
	private static Logger _logger = Logger.getLogger(RapidHttpServlet.class);
	private static JAXBContext _jaxbContext;	
	private static EncryptedXmlAdapter _encryptedXmlAdapter;
		
	// properties
	
	public static JAXBContext getJAXBContext() { return _jaxbContext; }
	public static void setJAXBContext(JAXBContext jaxbContext) { _jaxbContext = jaxbContext; }
	
	public static void setEncryptedXmlAdapter(EncryptedXmlAdapter encryptedXmlAdapter) { _encryptedXmlAdapter = encryptedXmlAdapter; }
		
	// public methods
	
	public static Marshaller getMarshaller() throws JAXBException, IOException {
		// marshaller is not thread safe so we need to create a new one each time
		Marshaller marshaller = _jaxbContext.createMarshaller();		
		// add the encrypted xml adapter
		marshaller.setAdapter(_encryptedXmlAdapter);
		// return
		return marshaller;		
	}
	
	public static Unmarshaller getUnmarshaller() throws JAXBException, IOException {
		
		// initialise the unmarshaller
		Unmarshaller unmarshaller = _jaxbContext.createUnmarshaller();
		// add the encrypted xml adapter
		unmarshaller.setAdapter(_encryptedXmlAdapter);
		
		// add a validation listener (this makes for better error messages)
		unmarshaller.setEventHandler(new ValidationEventHandler() {
			@Override
			public boolean handleEvent(ValidationEvent event) {
				// messages with "unrecognized type name" are very useful they're not sever themselves must almost always followed by a severe with a less meaningful message 
				if (event.getMessage().contains("unrecognized type name") || event.getSeverity() == ValidationEvent.FATAL_ERROR) {
					return false;
				} else {						
					return true;
				}
			}				
		});
		
		// return
		return unmarshaller;
	}
	
	public Logger getLogger() {	return (Logger) getServletContext().getAttribute("logger");	}
	
	public Constructor getSecurityConstructor(String type) {
		HashMap<String,Constructor> constructors = (HashMap<String, Constructor>) getServletContext().getAttribute("securityConstructors");
		return constructors.get(type);
	}
	
	public Constructor getActionConstructor(String type) {
		HashMap<String,Constructor> constructors = (HashMap<String, Constructor>) getServletContext().getAttribute("actionConstructors");
		return constructors.get(type);
	}
	
	public JSONArray getJsonDatabaseDrivers() {
		return (JSONArray) getServletContext().getAttribute("jsonDatabaseDrivers");
	}
	
	public JSONArray getJsonConnectionAdapters() {
		return (JSONArray) getServletContext().getAttribute("jsonConnectionAdapters");
	}
	
	public JSONArray getJsonSecurityAdapters() {
		return (JSONArray) getServletContext().getAttribute("jsonSecurityAdapters");
	}
	
	public JSONArray getJsonControls() {
		return (JSONArray) getServletContext().getAttribute("jsonControls");
	}
	
	public JSONObject getJsonControl(String type) throws JSONException {
		JSONArray jsonControls = getJsonControls();
		if (jsonControls != null) {
			for (int i = 0; i < jsonControls.length(); i++) {
				if (type.equals(jsonControls.getJSONObject(i).getString("type"))) return jsonControls.getJSONObject(i);
			}
		}
		return null;
	}
	
	public JSONArray getJsonActions() {
		return (JSONArray) getServletContext().getAttribute("jsonActions");
	}
	
	public JSONObject getJsonAction(String type) throws JSONException {
		JSONArray jsonActions = getJsonActions();
		if (jsonActions != null) {
			for (int i = 0; i < jsonActions.length(); i++) {
				if (type.equals(jsonActions.getJSONObject(i).getString("type"))) return jsonActions.getJSONObject(i);
			}
		}
		return null;
	}
		
	public Applications getApplications() {
		return (Applications) getServletContext().getAttribute("applications");
	}
			
	public Devices getDevices() {
		return (Devices) getServletContext().getAttribute("devices");
	}
	
	public String getSecureInitParameter(String name) {
		return getInitParameter(name);
	}
	
	// this is used to format between Java Date and XML date
	public SimpleDateFormat getXMLDateFormatter() {
		return (SimpleDateFormat) getServletContext().getAttribute("xmlDateFormatter");
	}
	
	// this is used to format between Java Date and XML dateTime
	public SimpleDateFormat getXMLDateTimeFormatter() {
		return (SimpleDateFormat) getServletContext().getAttribute("xmlDateTimeFormatter");
	}
	
	// this is used to format between Java Date and Local date format
	public SimpleDateFormat getLocalDateFormatter() {
		return (SimpleDateFormat) getServletContext().getAttribute("localDateFormatter");
	}
	
	// this is used to format between Java Date and local dateTime format (used by backups and page lock)
	public SimpleDateFormat getLocalDateTimeFormatter() {
		return (SimpleDateFormat) getServletContext().getAttribute("localDateTimeFormatter");
	}
	
	// this is used is actions such as database and webservice to cache results for off-line demos
	public ActionCache getActionCache() {
		return (ActionCache) getServletContext().getAttribute("actionCache");
	}
	
	public void sendException(HttpServletResponse response, Exception ex) throws IOException {
		sendException(null, response, ex);
	}
		
	public void sendException(RapidRequest rapidRequest, HttpServletResponse response, Exception ex) throws IOException {
		
		response.setStatus(500);
		
		PrintWriter out = response.getWriter();		
		
		out.print("Error : " + ex.getLocalizedMessage());
						
		boolean showStackTrace = Boolean.parseBoolean(getServletContext().getInitParameter("showStackTrace"));
				
		if (showStackTrace) {
			
			String stackTrace = "\n\n";
			
			if (rapidRequest != null) stackTrace += rapidRequest.getDetails() + "\n\n";
			
			stackTrace += ex.getClass().getName() + "\n\n";
			
			for (StackTraceElement element : ex.getStackTrace()) stackTrace += element + "\n";
						
			out.print(stackTrace);
		
		}
		
		if (rapidRequest == null) {
			
			_logger.error(ex);
						
		} else {
			
			_logger.error(ex.getLocalizedMessage() + "\n" + rapidRequest.getDetails(), ex);
						
		}
		
		out.close();
				
	}
	
	public void sendMessage(RapidRequest rapidRequest, HttpServletResponse response, int status, String title, String message ) throws IOException {
		
		response.setStatus(status);
		
		PrintWriter out = response.getWriter();		
		
		// write a header
		out.write("<html><head><title>Rapid - " + title + "</title><meta charset=\"utf-8\"/><link rel='stylesheet' type='text/css' href='styles/index.css'></link>");
					
		// write no permission
		out.write("<body><div class=\"image\"><img src=\"images/RapidLogo_200x134.png\" /></div><div class=\"title\"><span>Rapid - " + title + "</span></div><div class=\"info\"><p>" + message + "</p></div></body>");
		
		out.println();
										
		out.close();
		
	}
	
}
