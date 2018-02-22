using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Swapp.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using ThinkBox.Data;
using ThinkBox.Data.Models;

namespace ThinkBox.Web
{
    public class PersonController : BaseController
    {
        public PersonController(
            IConfigurationRoot config,
            IHostingEnvironment env,
            DbContextOptionsWrapper dbOptns,
            InjectorObjectHolder injHolder)
            : base(config, env, dbOptns, injHolder)
        {
        }


        [HttpGet]
        [Access]
        public IActionResult Get(
            string fName = null,
            string lName = null,
            string fNameFilter = null,
            string lNameFilter = null,
            long companyContactExceptionID = 0,
            long clubExceptionID = 0,
            int limit = 0,
            int offset = 0)
        {
            object[] result = null;

            try
            {
                result = _dbi.GetPersons(
                                fName: fName,
                                lName: lName,
                                fNameFilter: fNameFilter,
                                lNameFilter: lNameFilter,
                                companyContactExceptionID: companyContactExceptionID,
                                clubExceptionID: clubExceptionID,
                                limit: limit,
                                offset: offset)
                             .Select(l => l.Simplify()).ToArray();


                return Json(result);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                result = null;
            }
        }
    }
}
