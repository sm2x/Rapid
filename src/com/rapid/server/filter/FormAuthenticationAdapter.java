/*

Copyright (C) 2016 - Gareth Edwards / Rapid Information Systems

gareth.edwards@rapid-is.co.uk


This file is part of the Rapid Application Platform

Rapid is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version. The terms require you
to include the original copyright, and the license notice in all redistributions.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
in a file named "COPYING".  If not, see <http://www.gnu.org/licenses/>.

*/

package com.rapid.server.filter;

import java.io.IOException;
import java.net.InetAddress;
import java.security.GeneralSecurityException;
import java.util.Enumeration;
import java.util.List;

import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONObject;

import com.rapid.core.Application;
import com.rapid.core.Applications;
import com.rapid.core.Email;
import com.rapid.security.SecurityAdapter;
import com.rapid.security.SecurityAdapter.SecurityAdapaterException;
import com.rapid.server.RapidHttpServlet;
import com.rapid.server.RapidRequest;

public class FormAuthenticationAdapter extends RapidAuthenticationAdapter {

	public static final String LOGIN_PATH = "login.jsp";
	public static final String INDEX_PATH = "index.jsp";
	public static final String RESET_PATH = "reset.jsp";

	private static Logger _logger = LogManager.getLogger(RapidAuthenticationAdapter.class);

	private List<JSONObject> _jsonLogins = null;
	private String[] _ipChecks = null;


	public FormAuthenticationAdapter(FilterConfig filterConfig) {
		// call the super
		 super(filterConfig);
		// look for ip check for sensitive pages
		 String ipCheck = filterConfig.getInitParameter(INIT_PARAM_IP_CHECK);
		 // if we got some, build the array now
		 if (ipCheck != null) {
			 // split them
			 _ipChecks = ipCheck.split(",");
			 // loop them
			 for (int i = 0; i < _ipChecks.length; i++) {
				 // trim them for good measure, and replace *
				 _ipChecks[i] = _ipChecks[i].trim().replace("*","");
			 }
			 // log
			 _logger.info("IP addresses will be checked against " + ipCheck + " for access to sensitive resources.");
		 }
		 // log
		 _logger.info("Form authentication filter initialised.");

	}

	@Override
	public ServletRequest process(ServletRequest req, ServletResponse res) throws IOException, ServletException {

		// cast the ServletRequest to a HttpServletRequest
		HttpServletRequest request = (HttpServletRequest) req;

		// log the full request
		if (_logger.isTraceEnabled()) {
			_logger.debug("FormAuthenticationAdapter request : " + request.getMethod() + " " + request.getRequestURL() + (request.getQueryString() == null ? "" : "?" + request.getQueryString()));
			Enumeration<String> headerNames = request.getHeaderNames();
			String headers = "";
			while (headerNames.hasMoreElements()) {
				String headerName = headerNames.nextElement();
				headers += headerName + " = " + request.getHeader(headerName) + "; ";
			}
			_logger.debug("Headers : " + headers);
		}

		// now get just the resource path
		String requestPath = request.getServletPath();
		// if null set to root
		if (requestPath == null) requestPath = "/";
		if (requestPath.length() == 0) requestPath = "/";

		// if ip checking is in place
		if (_ipChecks != null) {
			// get the query string
			String queryString = request.getQueryString();
			// check we got one
			if (queryString == null) {
				// set to empty string
				queryString = "";
			} else {
				// set to lower case
				queryString = queryString.toLowerCase();
			}
			// if this is a sensitive resource
			if (requestPath.startsWith("/" + LOGIN_PATH) || requestPath.startsWith("/design.jsp") || requestPath.startsWith("/designpage.jsp") || requestPath.startsWith("/designer") || (requestPath.startsWith("/~") && queryString.contains("a=rapid"))) {
				// assume no pass
				boolean pass = false;
				// get the client IP
				String ip = request.getRemoteAddr();
				// if this is for login.jsp
				if (requestPath.startsWith("/" + LOGIN_PATH)) {
					// get the user agent
					String agent = request.getHeader("User-Agent");
					// if we got one
					if (agent != null) {
						// Rapid Mobile exempts just login.jsp from the IP checks
						if (agent.contains("RapidMobile")) pass = true;
					}
				}
				// if we haven't passed yet
				if (!pass) {
					// log
					_logger.debug("Checking IP " + ip + " for " + requestPath);
					// loop the ip checks
					for (String ipCheck : _ipChecks) {
						// check the ip starts with the filter, this allows full, or partial IPs (we remove the * for good measure)
						if (ip.startsWith(ipCheck)) {
							// we passed
							pass = true;
							// we're done
							break;
						}
					}
				}
				// if we failed
				if (!pass) {
					// log
					_logger.info("Access from " + ip + " for " + requestPath + " failed IP check");
					// cast the ServletRequest to a HttpServletRequest
					HttpServletResponse response = (HttpServletResponse) res;
					// send a not found
					response.sendError(404);
					// no further processing
					return null;
				}
			} // sensitive resource
		} // ip checks

		// if we can return this resource without authentication
		if (requestPath.endsWith("favicon.ico") || requestPath.startsWith("/images/") || requestPath.startsWith("/scripts") || requestPath.startsWith("/styles")) {

			// proceed to the next step
			return req;

		} else {

			// if it's a resource that requires authentication
			_logger.trace("FormAuthenticationAdapter checking authorisation");

			// cast response to http
			HttpServletResponse response = (HttpServletResponse) res;

			// assume default login page
			String loginPath = LOGIN_PATH;
			// assume default index page
			String indexPath = INDEX_PATH;
			// assume default password reset path
			String resetPath = RESET_PATH;

			// assume no userName
			String userName = null;

			// create a new session, if we need one
			HttpSession session = request.getSession();

			// look in the session for username
			userName = (String) session.getAttribute(RapidFilter.SESSION_VARIABLE_USER_NAME);

			// look in the session for index path
			String sessionIndexPath = (String) session.getAttribute(RapidFilter.SESSION_VARIABLE_INDEX_PATH);
			// if we got one use it
			if (sessionIndexPath != null) indexPath = sessionIndexPath;

			// look in the session for the password reset path
			String sessionResetPath = (String) session.getAttribute(RapidFilter.SESSION_VARIABLE_PASSWORDRESET_PATH);
			// if we got one use it
			if (sessionResetPath != null) resetPath = sessionResetPath;

			// if email is enabled and we requested the password reset
			if ((Email.getEmailSettings() != null && requestPath.endsWith(resetPath)))  {

				// look in the request for the username
				String email = request.getParameter("email");

				// if we got one
				if (email != null) {

					try {

						// get the applications collection
						Applications applications = (Applications) getServletContext().getAttribute("applications");

						// if there are some applications
						if (applications != null) {

							// loop all applications
							for (Application application : applications.get()) {

								// get a Rapid request
								RapidRequest rapidRequest = new RapidRequest(request, application);

								// have the security reset this email and break once done
								if (application.getSecurityAdapter().resetUserPassword(rapidRequest, email)) break;

							}

						}

					} catch (Exception ex) {
						// log the error
						_logger.error("FormAuthenticationAdapter error resetting password", ex);
					}

					// send a message to display
					request.getSession().setAttribute("message", "A new password has been emailed - click <a href='" + loginPath + "'>here</a> to log in");

				}

				// delay by 1sec to make brute force attacks a little harder
				try { Thread.sleep(1000); } catch (InterruptedException e) {}

				// proceed to the next step
				return req;

			} // password reset page request

			// check if we got a user name
			if (userName == null) {

				_logger.trace("No userName found in session");

				// look for a sessionRequestPath attribute in the session
				String sessionRequestPath = (String) session.getAttribute("requestPath");

				// look in the request for the username
				userName = request.getParameter("userName");

				// if jsonLogins is null try and get some from the servlet context
				if (_jsonLogins == null) _jsonLogins = (List<JSONObject>) req.getServletContext().getAttribute("jsonLogins");
				// if we have custom logins
				if (_jsonLogins != null) {

					// get the query string
					String queryString = request.getQueryString();

					// loop the login pages
					for (JSONObject jsonLogin : _jsonLogins) {
						// get the custom login path
						String customLoginPath = jsonLogin.optString("path").trim();
						// get the custom index
						String customIndexPath = jsonLogin.optString("index").trim();
						// get any password reset
						String customPasswordReset = jsonLogin.optString("passwordreset",null);

						// if the request is for a custom login page
						if (requestPath.endsWith(customLoginPath) || (queryString != null && customLoginPath.endsWith(queryString))) {
							// put the index path in the session
							session.setAttribute(RapidFilter.SESSION_VARIABLE_INDEX_PATH, customIndexPath);
							// put the password reset page in the session if there is one
							if (customPasswordReset != null) session.setAttribute(RapidFilter.SESSION_VARIABLE_PASSWORDRESET_PATH, customPasswordReset.trim());
							// remember this custom login
							loginPath = customLoginPath;
							// add cache defeating to try and stop the 302 from custom login .jsp pages to index.jsp
							RapidFilter.noCache(response);
							// we're done
							break;
						}
						// get the application parameter
						String appId = request.getParameter("a");
						// check we got one
						if (appId != null) {
							// if custom index is the app which has just been requested
							if (customIndexPath.endsWith("a=" + appId) || customIndexPath.contains("a=" + appId + "&")) {
								// put the index path in the session
								session.setAttribute(RapidFilter.SESSION_VARIABLE_INDEX_PATH, customIndexPath);
								// send a redirect to load the custom login
								response.sendRedirect(customLoginPath);
								// return immediately
								return null;
							}
						}
					}
				}

				// check for a user in the request
				if (userName == null) {

					_logger.trace("No userName found in request");

					// if we are attempting to authorise
					if (requestPath.endsWith(loginPath) && sessionRequestPath != null) {

						// check the url for a requestPath
						String urlRequestPath = request.getParameter("requestPath");
						// overide the session one if so
						if (urlRequestPath != null) session.setAttribute("requestPath", urlRequestPath);
						// progress to the next step in the filter
						return req;

					} else {

						// if we're allowing public access, but not if this is the login page, nor RapidMobile
						if (_publicAccess && !requestPath.endsWith(loginPath) && !request.getHeader("User-Agent").contains("RapidMobile")) {

							// set the user name to public
							session.setAttribute(RapidFilter.SESSION_VARIABLE_USER_NAME, PUBLIC_ACCESS_USER);
							// set the password to none
							session.setAttribute(RapidFilter.SESSION_VARIABLE_USER_PASSWORD, "");
							// progress to the next step in the filter
							return req;

						}

					}

					String acceptHeader = request.getHeader("Accept");
					if (acceptHeader == null) acceptHeader = "";

					// if this is json and not a login page just send a 401
					if (acceptHeader.contains("application/json")) {

						// if this a request for a login page that came through an ajax json request
						if (requestPath.endsWith(loginPath)) {

							// send a 401 with the login path
							response.sendError(401, "location=" + loginPath);

						} else {

							// send a standard 401 - access denied
							response.sendError(401);

						}

					} else {

						// retain the request path less the leading /
						String authorisationRequestPath = requestPath.substring(1);
						// replace designpage.jsp with design.jsp to get us out of the parent
						authorisationRequestPath = authorisationRequestPath.replace("designpage.jsp", "design.jsp");
						// append the query string if there was one
						if (request.getQueryString() != null) authorisationRequestPath += "?" + request.getQueryString();
						// retain the request path in the session
						session.setAttribute("requestPath", authorisationRequestPath);

						// send a redirect to load the login page unless the login path (from the custom login) is the request path (this creates a redirect)
						if (authorisationRequestPath.equals(loginPath) && request.getHeader("User-Agent").contains("RapidMobile")) {
							// send a 401 with the login path to get RapidMobile to authenticate
							response.sendError(401, "location=" + loginPath);
						} else {
							response.sendRedirect(loginPath);
						}

					}

					// return immediately
					return null;

				} else {

					// log that we were provided with a user name
					_logger.trace("userName found in request");

					// look in the request for the password
					String userPassword = request.getParameter("userPassword");

					// look in the request for device details
					String deviceId = request.getParameter("deviceId");

					// get the address from the request host
					InetAddress inetAddress = InetAddress.getByName(request.getRemoteHost());

					// get the request device details
					String deviceDetails = "ip=" + inetAddress.getHostAddress() + ",name=" + inetAddress.getHostName() + ",agent=" + request.getHeader("User-Agent");

					// if we were sent a device id add it to the device details
					if (deviceId != null)  deviceDetails += "," + deviceId;

					// retain device id in the session so it's used when check app authorisation
					session.setAttribute(RapidFilter.SESSION_VARIABLE_USER_DEVICE, deviceDetails);

					// remember whether we are authorised for at least one application
					boolean authorised = RapidFilter.isAuthorised(req, userName, userPassword, indexPath);
					
					// we passed authorisation so redirect the client to the resource they wanted
					if (authorised) {

						// retain user name in the session
						session.setAttribute(RapidFilter.SESSION_VARIABLE_USER_NAME, userName);

						// retain encrypted user password in the session
						try {
							session.setAttribute(RapidFilter.SESSION_VARIABLE_USER_PASSWORD, RapidHttpServlet.getEncryptedXmlAdapter().marshal(userPassword));
						} catch (GeneralSecurityException ex) {
							// log the error
							_logger.error("FormAuthenticationAdapter error storing encrypted password", ex);
						}

						// log that authentication was granted
						_logger.debug("FormAuthenticationAdapter authenticated " + userName + " from " + deviceDetails);

						// make the sessionRequest path the root just in case it was null (or login.jsp itself)
						if (sessionRequestPath == null || loginPath.equals(sessionRequestPath)) {
							// if index path is the default (usually index.jsp)
							if (INDEX_PATH.equals(indexPath)) {
								// convert to . to hide index.jsp from url
								sessionRequestPath = ".";
							} else {
								// request custom index path
								sessionRequestPath = indexPath;
							}
						}

						// if we had a requestApp in the sessionRequestPath, go straight to the app
						if (sessionRequestPath.indexOf("requestApp") > 0) {
							// split the parts
							String[] requestAppParts = sessionRequestPath.split("=");
							// if we have a second part with the appId in it
							if (requestAppParts.length > 1) {
								// set the sessionRequestPath to the appId
								sessionRequestPath = "~?a=" + requestAppParts[1];
							}
 						}

						// remove the authorisation session attribute
						session.setAttribute("requestPath", null);

						// send a redirect to reload what we wanted before
						response.sendRedirect(sessionRequestPath);

						// return to client immediately
						return null;

					} else {

						// log that authentication was unsuccessful
						_logger.debug("FormAuthenticationAdapter failed for " + userName + " from " + deviceDetails);

						// start the message
						String message = "Your user name or password has not been recognised";

						// if email is configured
						if (Email.getEmailSettings() != null) {

							// if any app has password reset
							if (SecurityAdapter.hasPasswordReset(getServletContext())) message += " - click <a href='" + resetPath + "'>here</a> to reset your password";
						}

						// retain the authorisation attempt in the session
						session.setAttribute("message", message);

						// delay by 1sec to make brute force attacks a little harder
						try { Thread.sleep(1000); } catch (InterruptedException e) {}

						// send a redirect to load the login page
						response.sendRedirect(loginPath);

						// return immediately
						return null;

					} // authorised

				} // check for a username parameter in request data

			} // authentication check (whether username is in session)

			// if we are requesting the login.jsp or root but have authenticated, go to index instead
			if ((requestPath.contains(loginPath) || "/".equals(requestPath)) && "GET".equals(request.getMethod())) {

				// send a redirect to load the index
				response.sendRedirect(indexPath);

				// return immediately
				return null;

			}

			// return the request which will process the chain
			// hold a reference to the original request
			HttpServletRequest filteredReq = request;

			// wrap the request if it is not a rapid request (with our username and principle)
			if(!(request instanceof RapidRequestWrapper)) filteredReq = new RapidRequestWrapper(request, userName);

			return filteredReq;

		}

	}

}
