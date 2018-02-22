namespace ThinkBox.Web
{
    public class AccountProfileViewModel
    {
        public AccountProfileViewModel()
        {
        }

        public string UID { get; set; }
        public string AccountName { get; set; }
        public string FName { get; set; }
        public string LName { get; set; }
        public string Email { get; set; }
        public bool EmailConfirmed { get; set; }
    }
}
