using Swapp.Data;
using System.Threading.Tasks;

namespace ThinkBox.Web
{
    public class DevMailService : BaseMailService
    {
        private const int DEFAULT_PORT = 465;


        public DevMailService()
            : base()
        {
            _serverName = DevSecrets.GetSecretValue("swappAccount:serverName");
            _userName = DevSecrets.GetSecretValue("swappAccount:email");
            _fromEmail = DevSecrets.GetSecretValue("swappAccount:email");
            _password = DevSecrets.GetSecretValue("swappAccount:emailPassword");

            _useSSL = true;

            _port = DEFAULT_PORT;
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
