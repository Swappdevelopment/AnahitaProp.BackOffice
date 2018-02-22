using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Linq;
using ThinkBox.Data;
using ThinkBox.Data.Models;

namespace ThinkBox.Web
{
    public class MenuController : BaseController
    {
        public MenuController(
            IConfigurationRoot config,
            IHostingEnvironment env,
            DbContextOptionsWrapper dbOptns,
            InjectorObjectHolder injHolder)
            : base(config, env, dbOptns, injHolder)
        {
        }


        [HttpGet]
        [Access]
        public IActionResult GetAccexs()
        {
            Accex[] accexs = null;

            object[] result = null;
            string fullName = null;
             
            try
            {
                accexs = _dbi.GetAccountAccexs(onlyRootLevel: true);
                fullName = GetUserFullName(this.User);

                result = accexs?.Select(l => l.ToFrontMenu()).ToArray();

                return Json(new
                {
                    result = result,
                    fullName = fullName,
                    email = _dbi?.LoginConnectionToken?.Email,
                    gender = _dbi?.LoginConnectionToken?.Gender
                });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                accexs = null;
                result = null;
                fullName = null;
            }
        }
    }
}
