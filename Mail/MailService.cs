using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

namespace AnahitaProp.BackOffice
{
    public class MailService : BaseMailService
    {
        private const int DEFAULT_PORT = 1025;


        public MailService(IConfigurationRoot config)
            : base()
        {
            if (config != null)
            {
                _serverName = config["EmailAccount:server"];
                _userName = config["EmailAccount:userName"];
                _fromEmail = config["EmailAccount:fromEmail"];
                _password = config["EmailAccount:password"];
                _port = int.Parse(config["EmailAccount:port"]);
                _useSSL = bool.Parse(config["EmailAccount:useSSL"]);
            }

            _port = _port > 0 ? _port : DEFAULT_PORT;
        }


        public override async Task SendEmailAsync(
            string subject,
            string message,
            bool isMessageHtml = false,
            string toEmail = null,
            string fromEmail = null,
            string fromName = null,
            string replyToEmail = null,
            string replyToName = null,
            int port = DEFAULT_PORT)
        {
            await base.SendEmailAsync(subject, message, isMessageHtml: isMessageHtml, toEmail: toEmail, fromEmail: fromEmail, fromName: fromName, replyToEmail: replyToEmail, replyToName: replyToName, port: port);
        }
    }
}
