using System;
using System.Net;

namespace ThinkBox.Web
{
    public class ExceptionAccess : Exception
    {
        public ExceptionAccess(HttpStatusCode statusCode)
            : this(statusCode, null)
        {
        }
        public ExceptionAccess(HttpStatusCode statusCode, Exception innerException)
            : this(statusCode, null, innerException)
        {
        }
        public ExceptionAccess(HttpStatusCode statusCode, object content, Exception innerException)
            : this((int)statusCode, content, innerException)
        {
        }

        public ExceptionAccess(int statusCode)
            : this(statusCode, null)
        {
        }
        public ExceptionAccess(int statusCode, Exception innerException)
            : this(statusCode, null, innerException)
        {
        }
        public ExceptionAccess(int statusCode, object content, Exception innerException)
            : base(null, innerException)
        {
            this.StatusCode = statusCode;
            this.Content = content;
        }

        public int StatusCode { get; private set; }
        public object Content { get; private set; }
    }
}
