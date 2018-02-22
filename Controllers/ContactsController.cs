using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Swapp.Data;
using System;
using ThinkBox.Data;

namespace ThinkBox.Web
{
    public class ContactsController : BaseController
    {
        public ContactsController(
            IConfigurationRoot config,
            IHostingEnvironment env,
            DbContextOptionsWrapper dbOptns,
            InjectorObjectHolder injHolder)
            : base(config, env, dbOptns, injHolder)
        {
        }


        [Access]
        [HttpGet]
        [ResponseCache(NoStore = true)]
        public IActionResult GetContactsList(
            string nameFilter = null,
            SortDirection sortDirName = SortDirection.None,
            SortDirection sortDirOccup = SortDirection.None)
        {
            object[] result = null;

            try
            {
                if (_dbi == null) throw new NullReferenceException(nameof(_dbi));


                result = _dbi.GetCompanyContacts(nameFilter: nameFilter, sortDirName: sortDirName, sortDirOccup: sortDirOccup);

                return Json(result);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }
    }
}
