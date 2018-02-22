using System;
using System.Threading.Tasks;

namespace ThinkBox.Web
{
    public interface IMailService : IDisposable
    {
        Task SendEmailAsync(string subject, string message, bool isMessageHtml = false, string toEmail = null, string fromEmail = null, string fromName = null, string replyToEmail = null, string replyToName = null, int port = 0);
    }
}
