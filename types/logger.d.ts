interface Logger {
    // Logger: logging framework
    debug(...params:  any[]);
    /**
     * log debug message (severity level 7).
     */
    info(...params:  any[]);
    /**
     * log information message (severity level 6).
     */
    notice(...params:  any[]);
    /**
     * log notice message (severity level 5).
     */
    warn(...params:  any[]);
    /**
     * log warning message (severity level 4).
     */
    error(...params:  any[]);
    /**
     * log error message (severity level 3).
     */
    critical(...params:  any[]);
    /**
     * log critical error message (severity level 2).
     */
    alert(...params:  any[]);
    /**
     * log alert message (severity level 1).
     */
    emergency(...params:  any[]);
    /**
     * log emergency message (severity level 0).
     */
}
