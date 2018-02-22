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
    public class TrainingController : BaseController
    {
        public TrainingController(
            IConfigurationRoot config,
            IHostingEnvironment env,
            DbContextOptionsWrapper dbOptns,
            InjectorObjectHolder injHolder)
            : base(config, env, dbOptns, injHolder)
        {
        }


        [HttpGet]
        [Access]
        [MenuRequirement("trainings>crud")]
        public IActionResult Get(long companyID = 0, string nameFilter = null, short? statusFilter = null, int limit = 0, int offset = 0)
        {
            CourseDetail[] courses = null;

            object[] result = null;

            try
            {
                courses = _dbi.GetCourses(
                                companyID: companyID,
                                nameFilter: nameFilter,
                                statusFilter: statusFilter,
                                includeModuleCount: true,
                                includeParticipantsCount: true,
                                includeReportLength: true,
                                includeObjectivesLength: true,
                                includeVenuesCount: true,
                                limit: limit, offset: offset);

                result = courses.Select(l => l.Simplify(false, false, true)).ToArray();

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

        [HttpGet]
        [Access]
        [MenuRequirement("trainings")]
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
        [MenuRequirement("trainings>crud")]
        public IActionResult ChangeStatus([FromBody]dynamic param)
        {
            try
            {
                if (param == null) throw new NullReferenceException();


                long id = param.id;

                ModelStatus status = (ModelStatus)((short)param.status);

                _dbi.ChangeModelStatus("CourseDetails", id, status);

                return Json(new { ok = true });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }




        /*****  TRAINING STEPS  ******
         * 
         * 
         *  STEP 1
         *      Create new Catalog
         *          Name
         *          Duration
         *          Status i.e. Tailor made or Public
         *          Topics
         *      OR
         *      Select Existing Catalog
         *      
         *      Choose Expert
         *          Get CV
         *          Confirm Expert
         *      
         *      SUBMIT MQA
         *
         *  STEP 2
         *      Recieve MQA Approval
         *      Set Venue
         *          Confirm
         *      Set Equipments
         *          Confirm
         *      -> Send Planning to MQA
         *      -> Trainees fill G1
         *      
         *  STEP 3 (Closure)
         *      Set Official End Date
         *      Send Invoice
         *      Send Certificates
         *      CLOSED
         *      
         *  STEP 4 (Data Gathering)
         *      Fill in Report (Free text)
         *      Send Survey to be filled by trainees
         * 
         * 
         * **************************/
    }
}
