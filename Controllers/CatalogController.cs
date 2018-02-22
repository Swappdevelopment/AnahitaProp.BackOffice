using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Swapp.Data;
using System;
using System.Linq;
using ThinkBox.Data;
using ThinkBox.Data.Models;

namespace ThinkBox.Web
{
    public class CatalogController : BaseController
    {
        public CatalogController(
            IConfigurationRoot config,
            IHostingEnvironment env,
            DbContextOptionsWrapper dbOptns,
            InjectorObjectHolder injHolder)
            : base(config, env, dbOptns, injHolder)
        {
        }

        [HttpGet]
        [Access]
        [MenuRequirement("catalogs")]
        public IActionResult Get(string titleFilter = null, short? statusFilter = null, int limit = 0, int offset = 0)
        {
            object[] result = null;

            try
            {
                result = _dbi.GetCourseHeaders(
                                titleFilter: titleFilter,
                                includeDetails: false,
                                statusFilter: statusFilter,
                                limit: limit,
                                offset: offset)?.Select(l => l.Simplify(false, 0, 0)).ToArray();

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

        [HttpGet]
        [Access]
        [MenuRequirement("catalogs")]
        public IActionResult GetObjectives(long headerID = 0)
        {
            string result = null;

            try
            {
                if (headerID > 0)
                {
                    result = _dbi.GetCourseHeaderObjectivesValue(headerID);
                }

                return Json(new { result = result });
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

        [HttpPost]
        [Access]
        [MenuRequirement("catalogs>crud")]
        public IActionResult Save([FromBody]dynamic param)
        {
            CourseHeader header = null;
            CourseHeaderObjective[] dbObjectives = null;
            string objectives = null;

            try
            {
                if (param == null) throw new NullReferenceException();


                header = Helper.JSonCamelDeserializeObject<CourseHeader>(param);

                if (header == null) throw new NullReferenceException();


                objectives = param.fromObjectives;

                if (string.IsNullOrEmpty(objectives))
                {
                    header.Objectives = new ObjectCollection<CourseHeaderObjective>();
                }
                else
                {
                    header.Objectives = new ObjectCollection<CourseHeaderObjective>(BaseDesc.StringToDescs<CourseHeaderObjective>(objectives));
                }


                switch (header.RecordState)
                {
                    case RecordState.Added:

                        break;

                    case RecordState.Updated:

                        if (header.ID > 0)
                        {
                            dbObjectives = _dbi.GetCourseHeaderObjectives(header.ID);
                        }
                        break;

                    case RecordState.Deleted:

                        header.RecordState = RecordState.None;

                        if (header.ID > 0)
                        {
                            header.RegisterForRecordStateChange();
                            header.Status = ModelStatus.Inactive;
                            header.RegisterForRecordStateChange();
                        }
                        break;
                }



                return Json(new { result = "" });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                header = null;
                objectives = null;
            }
        }

        [HttpPost]
        [Access]
        [MenuRequirement("catalogs>crud")]
        public IActionResult ChangeStatus([FromBody] dynamic param = null)
        {
            try
            {
                long id = param.id;

                ModelStatus status = (ModelStatus)((short)param.status);

                _dbi.ChangeModelStatus("CourseHeaders", id, status);

                return Json(new { ok = true });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);

            }
        }


        [HttpGet]
        [Access]
        [MenuRequirement("companies>contacts")]
        public IActionResult GetCourses(long companyID = 0, string nameFilter = null, short? statusFilter = null, int limit = 0, int offset = 0)
        {
            CourseDetail[] courses = null;

            object[] result = null;

            try
            {
                courses = _dbi.GetCourses(companyID: companyID, nameFilter: nameFilter, limit: limit, offset: offset);

                result = courses.Select(l => l.Simplify()).ToArray();

                return Json(result);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                courses = null;
                result = null;
            }
        }
    }
}
