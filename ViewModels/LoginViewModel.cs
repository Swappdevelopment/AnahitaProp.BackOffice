namespace ThinkBox.Web
{
    public class LoginViewModel
    {
        public LoginViewModel()
        {
        }

        public string User { get; set; }
        public string Password { get; set; }
        public bool Remember { get; set; }
        public bool SignOut { get; set; } = false;
    }
}
