package com.bookworm.util;

import com.bookworm.entity.User;
import com.bookworm.exception.UnauthorizedException;
import com.bookworm.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Thin session helper.
 *
 * After a successful login/register the userId is stored in the HTTP session.
 * Subsequent requests pass the JSESSIONID cookie automatically.
 */
@Component
@RequiredArgsConstructor
public class SessionHelper {

    public static final String SESSION_KEY = "userId";

    private final UserRepository userRepository;

    /** Store userId in session and return the session id. */
    public void createSession(HttpServletRequest request, String userId) {
        HttpSession session = request.getSession(true);
        session.setAttribute(SESSION_KEY, userId);
    }

    /** Remove the session. */
    public void invalidateSession(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }

    /** Return the current user or null if not authenticated. */
    public User getCurrentUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return null;
        String userId = (String) session.getAttribute(SESSION_KEY);
        if (userId == null) return null;
        return userRepository.findById(userId).orElse(null);
    }

    /** Return the current user or throw 401. */
    public User requireUser(HttpServletRequest request) {
        User user = getCurrentUser(request);
        if (user == null) throw new UnauthorizedException("Authentication required");
        return user;
    }
}
