using AnahitaProp.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SpaServices.Webpack;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Serialization;
using Swapp.Data;
using System;
using System.Net;

namespace AnahitaProp.BackOffice
{
    public class Startup
    {
        
        private IHostingEnvironment _env = null;

        public Startup(IHostingEnvironment env)
        {
            _env = env;

            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // Add framework services.
            services.AddMvc()
                .AddJsonOptions(options =>
                {
                    options.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
                    options.SerializerSettings.Converters.Add(new SwpDateTimeConverter());
                });

            services.AddSingleton(this.Configuration);
            services.AddSingleton(_env);
            services.AddSingleton(new InjectorObjectHolder());

            services.AddSingleton(s =>
            {
                var builder = new DbContextOptionsBuilder<AppDbContext>();

                string connStr = null;

                if (_env.IsDevelopment())
                {
                    connStr = DevSecrets.GetSecretValue("connectionStrings:anahitaProp:local:mysql");
               }
                else if (_env.IsStaging())
                {
                    connStr = Configuration["ConnectionStrings:staging:value"];
                }
                else
                {
                    connStr = Configuration["ConnectionStrings:production:value"];
                }

                return new DbContextOptionsWrapper(builder.Options, connStr); 
            });


            services.AddAuthorization(options =>
            {
                options.AddPolicy(AccessAttribute.TOKEN_KEY,
                          policy => policy.Requirements.Add(new AccessRequirement(allowInvalidPasswordFormat: false)));

                options.AddPolicy(AccessAttribute.TOKEN_ALLOW_INVLD_PASSWORD_KEY,
                          policy => policy.Requirements.Add(new AccessRequirement(allowInvalidPasswordFormat: true)));
            });

            services.AddSingleton<IAuthorizationHandler, AccessRequirementHandler>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseBrowserLink();

                app.UseWebpackDevMiddleware(new WebpackDevMiddlewareOptions()
                {
                    HotModuleReplacement = true,
                    ReactHotModuleReplacement = true
                });
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseExceptionHandler(
                         options =>
                         {
                             options.Run(
                                 async context =>
                                 {
                                     var ex = context.Features.Get<IExceptionHandlerFeature>()?.Error;

                                     string errMsg = "";

                                     int statusCode = (ex is ExceptionAccess) ? ((ExceptionAccess)ex).StatusCode : (int)HttpStatusCode.InternalServerError;

                                     bool inDev = _env == null ? false : _env.IsDevelopment();

                                     object content = null;


                                     if (inDev)
                                     {
                                         content = BaseController.ErrorObject(statusCode, ex);
                                     }
                                     else if (ex is ExceptionID)
                                     {
                                         content = BaseController.ErrorObject(statusCode, ((ExceptionID)ex).ErrorID);
                                     }
                                     else
                                     {
                                         content = BaseController.ErrorObject(statusCode, null);
                                     }

                                     context.Response.StatusCode = statusCode;
                                     context.Response.ContentType = "application/json";

                                     errMsg = Helper.JSonCamelSerializeObject(content);


                                     await context.Response.WriteAsync(errMsg).ConfigureAwait(false);
                                 });
                         }
                        );


            var temp = new CookieAuthenticationOptions()
            {
                AuthenticationScheme = BaseController.APP_ID,
                CookieHttpOnly = true,
                AutomaticAuthenticate = true,
                AutomaticChallenge = true,
                //LoginPath = "/login",
                //CookiePath = $"/{BaseController.APP_ID}",
                //Events = new CookieAuthenticationEvents()
                //{
                //    OnValidatePrincipal = CookieAuthenticationEventsHandler.ValidateAsync
                //}
                Events = new CookieAuthenticationEvents()
            };

            app.UseCookieAuthentication(temp);

            app.UseStaticFiles(new StaticFileOptions
            {
                OnPrepareResponse = ctx =>
                {
                    string path = ctx.File.PhysicalPath;

                    TimeSpan maxAge;

                    if (path.EndsWith(".css") || path.EndsWith(".js") || path.EndsWith(".map"))
                    {
                        maxAge = new TimeSpan(120, 0, 0);
                        ctx.Context.Response.Headers.Append("Cache-Control", "max-age=" + maxAge.TotalSeconds.ToString("0"));
                    }
                    else if (path.EndsWith(".gif") || path.EndsWith(".jpg") || path.EndsWith(".jpeg") || path.EndsWith(".png") || path.EndsWith(".svg") || path.EndsWith(".ico"))
                    {
                        maxAge = new TimeSpan(150, 0, 0);
                        ctx.Context.Response.Headers.Append("Cache-Control", "max-age=" + maxAge.TotalSeconds.ToString("0"));
                    }
                    else if (path.EndsWith(".otf") || path.EndsWith(".eot") || path.EndsWith(".ttf") || path.EndsWith(".woff") || path.EndsWith(".woff2"))
                    {
                        maxAge = new TimeSpan(120, 0, 0, 0);
                        ctx.Context.Response.Headers.Append("Cache-Control", "max-age=" + maxAge.TotalSeconds.ToString("0"));
                    }
                }
            });

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");

                routes.MapSpaFallbackRoute("spa-fallback", new { controller = "Home", action = "Index" });
            });

            //app.MapWhen(context => !context.Request.Path.Value.StartsWith("/api"), builder =>
            //{
            //    builder.UseMvc(routes =>
            //    {
            //        routes.MapSpaFallbackRoute("spa-fallback", new { controller = "Home", action = "Index" });
            //    });
            //});
        }
    }
}
