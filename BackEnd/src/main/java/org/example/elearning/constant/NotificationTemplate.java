package org.example.elearning.constant;

/**
 * Notification templates for E-learning system
 * Contains all notification titles, messages, and types as constants
 */
public final class NotificationTemplate {
    
    // Notification Types
    public static final String TYPE_SYSTEM = "SYSTEM";
    public static final String TYPE_COURSE = "COURSE";
    public static final String TYPE_ENROLLMENT = "ENROLLMENT";
    public static final String TYPE_PROMOTION = "PROMOTION";
    
    // Course Approval
    public static final String COURSE_APPROVAL_REQUEST_TITLE = "Yêu cầu duyệt khóa học mới";
    public static final String COURSE_APPROVAL_REQUEST_MESSAGE = "Giảng viên %s đã gửi yêu cầu duyệt khóa học '%s'";
    
    public static final String COURSE_APPROVED_TITLE = "Khóa học đã được duyệt";
    public static final String COURSE_APPROVED_MESSAGE = "Khóa học '%s' của bạn đã được phê duyệt và có thể xuất bản";
    
    public static final String COURSE_REJECTED_TITLE = "Khóa học bị từ chối";
    public static final String COURSE_REJECTED_MESSAGE = "Khóa học '%s' của bạn đã bị từ chối. Lý do: %s";
    
    // URL Patterns
    public static final String ADMIN_COURSE_DETAIL_URL = "/admin/courses/%d";
    public static final String INSTRUCTOR_COURSE_DETAIL_URL = "/instructor/courses/%d";
    public static final String COURSE_DETAIL_URL = "/courses/%d";
    
    private NotificationTemplate() {
        throw new AssertionError("Cannot instantiate constants class");
    }
    
    /**
     * Build notification link for admin course detail
     */
    public static String buildAdminCourseLink(Long courseId) {
        return String.format(ADMIN_COURSE_DETAIL_URL, courseId);
    }
    
    /**
     * Build notification link for instructor course detail
     */
    public static String buildInstructorCourseLink(Long courseId) {
        return String.format(INSTRUCTOR_COURSE_DETAIL_URL, courseId);
    }
    
    /**
     * Build notification link for course detail
     */
    public static String buildCourseLink(Long courseId) {
        return String.format(COURSE_DETAIL_URL, courseId);
    }
    
    /**
     * Build course approval request message
     */
    public static String buildCourseApprovalRequestMessage(String instructorName, String courseTitle) {
        return String.format(COURSE_APPROVAL_REQUEST_MESSAGE, instructorName, courseTitle);
    }
    
    /**
     * Build course approved message
     */
    public static String buildCourseApprovedMessage(String courseTitle) {
        return String.format(COURSE_APPROVED_MESSAGE, courseTitle);
    }
    
    /**
     * Build course rejected message
     */
    public static String buildCourseRejectedMessage(String courseTitle, String reason) {
        return String.format(COURSE_REJECTED_MESSAGE, courseTitle, reason);
    }
}
