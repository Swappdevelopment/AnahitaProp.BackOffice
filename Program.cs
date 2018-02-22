using Microsoft.AspNetCore.Hosting;
using System.IO;

namespace AnahitaProp.BackOffice
{
    public class Program
    {
        public static string VERSION = "1.00.00.00000";


        public static void Main(string[] args)
        {
            var host = new WebHostBuilder()
                .UseKestrel()
                .UseContentRoot(Directory.GetCurrentDirectory())
                .UseIISIntegration()
                .UseStartup<Startup>()
                .UseApplicationInsights()
                .Build();

            host.Run();
        }
    }
}
