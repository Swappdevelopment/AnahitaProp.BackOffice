using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using Swapp.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using ThinkBox.Data;
using ThinkBox.Data.Models;

namespace ThinkBox.Web
{
    public class ClubController : BaseController
    {
        public ClubController(
            IConfigurationRoot config,
            IHostingEnvironment env,
            DbContextOptionsWrapper dbOptns,
            InjectorObjectHolder injHolder)
            : base(config, env, dbOptns, injHolder)
        {
        }

        [HttpGet]
        [Access]
        [MenuRequirement("clubs")]
        public IActionResult Get(string nameFilter = null, short? statusFilter = null, int limit = 0, int offset = 0)
        {
            object[] result = null;

            try
            {
                result = _dbi.GetClubs(nameFilter: nameFilter, statusFilter: statusFilter, limit: limit, offset: offset)?.Select(l => l.Simplify()).ToArray();

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

        [HttpPost]
        [Access]
        [MenuRequirement("clubs>crud")]
        public IActionResult Save([FromBody] dynamic param = null)
        {
            Club club = null;

            try
            {
                club = Helper.JSonCamelDeserializeObject<Club>(param);

                if (club == null || club.RecordState == RecordState.None)
                {
                    club = null;
                }
                else
                {
                    _dbi.ManageIdentityModels(club);

                    if (club.RecordState == RecordState.Deleted)
                    {
                        club = null;
                    }
                    else
                    {
                        club = _dbi.GetClub(name: club.Name);
                    }
                }

                return Json(club == null ? new { ok = true } : club.Simplify());
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                club = null;
            }
        }

        [HttpPost]
        [Access]
        [MenuRequirement("clubs>crud")]
        public IActionResult ChangeStatus([FromBody] dynamic param = null)
        {
            try
            {
                long id = param.id;

                ModelStatus status = (ModelStatus)((short)param.status);

                _dbi.ChangeModelStatus("Clubs", id, status);

                return Json(new { ok = true });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);

            }
        }

        [HttpGet]
        [Access]
        [MenuRequirement("clubs>members")]
        public IActionResult GetMembers(long clubID = 0, string nameFilter = null, short? statusFilter = null, int limit = 0, int offset = 0)
        {
            ClubMember[] members = null;

            object[] result = null;

            try
            {
                members = this.QueryClubMembers(clubID: clubID, nameFilter: nameFilter, statusFilter: statusFilter, limit: limit, offset: offset);

                result = members.Select(l => l.Simplify()).ToArray();

                return Json(result);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                members = null;
                result = null;
            }
        }

        private ClubMember[] QueryClubMembers(
            string uid = null,
            string email = null,
            string fName = null,
            string lName = null,
            string nameFilter = null,
            short? statusFilter = null,
            long clubID = 0,
            int limit = 0,
            int offset = 0)
        {
            ClubMember[] members = null;

            try
            {
                members = _dbi.GetPersons(uid: uid, email: email, fName: fName, lName: lName, clubID: clubID, nameFilter: nameFilter, statusFilter: statusFilter, limit: limit, offset: offset)
                               .Where(l => l.ClubMembers != null)
                               .SelectMany(l => l.ClubMembers).ToArray();

                return members;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                members = null;
            }
        }


        [HttpPost]
        [Access]
        [MenuRequirement("clubs>members>crud")]
        public IActionResult SaveMember([FromBody] JObject param = null)
        {
            ClubMember clubMember = null;
            Person person = null;

            List<IdentityModel> toSave = null;

            try
            {
                clubMember = Helper.JSonCamelDeserializeObject<ClubMember>(param);

                if (clubMember == null || clubMember.RecordState == RecordState.None)
                {
                    clubMember = null;
                }
                else
                {
                    clubMember.Occupation_Id = clubMember.Occupation_Id <= 0 ? null : clubMember.Occupation_Id;
                    clubMember.Company_Id = clubMember.Company_Id <= 0 ? null : clubMember.Company_Id;

                    if (clubMember.RecordState == RecordState.Deleted)
                    {
                        _dbi.ManageIdentityModels(clubMember);
                        clubMember = null;
                    }
                    else
                    {
                        person = Helper.JSonCamelDeserializeObject<Person>(param);

                        if (person == null) throw new NullReferenceException();


                        toSave = new List<IdentityModel>()
                        {
                            person,
                            clubMember
                        };


                        person.ID = clubMember.Member_Id;

                        if (person.ID > 0)
                        {
                            person.RecordState = RecordState.Updated;

                            if (person.TelNumbers != null && person.TelNumbers.Count > 0)
                            {
                                foreach (var telNum in person.TelNumbers.Where(l => l.RecordState != RecordState.None))
                                {
                                    if (telNum.RecordState == RecordState.Deleted && telNum.ID > 0)
                                    {
                                        toSave.Add(telNum);
                                    }
                                    else
                                    {
                                        telNum.Company_Id = telNum.Company_Id <= 0 ? null : telNum.Company_Id;
                                        telNum.Person_Id = person.ID;
                                        telNum.Name = string.IsNullOrEmpty(telNum.Name) ? TelNumber.DEFAULT_NAME : telNum.Name;
                                        toSave.Add(telNum);
                                    }
                                }
                            }
                        }
                        else if (person.RecordState == RecordState.Added)
                        {
                            bool forceSave = param.JGetPropVal<bool>("forceSave");

                            if (!forceSave && _dbi.PersonNameUsed(person.LName, person.FName))
                                throw new ExceptionID(MessageIdentifier.MYSQL_DUPLICATE);


                            person.UID = Helper.GenerateSequentialGuid().ToString();
                            clubMember.AddCommand("Member_Id", $"SELECT ID FROM Persons WHERE UID = '{person.UID}' ");

                            if (person.TelNumbers != null && person.TelNumbers.Count > 0)
                            {
                                foreach (var telNum in person.TelNumbers.Where(l => l.RecordState == RecordState.Added || l.RecordState == RecordState.Updated))
                                {
                                    telNum.RecordState = RecordState.Added;
                                    telNum.Company_Id = telNum.Company_Id <= 0 ? null : telNum.Company_Id;
                                    telNum.Person_Id = null;
                                    telNum.AddCommand("Person_Id", $"SELECT ID FROM Persons WHERE UID = '{person.UID}' ");
                                    telNum.Name = string.IsNullOrEmpty(telNum.Name) ? TelNumber.DEFAULT_NAME : telNum.Name;
                                    toSave.Add(telNum);
                                }
                            }
                        }

                        _dbi.ManageIdentityModels(toSave.ToArray());

                        clubMember = QueryClubMembers(uid: person.UID, clubID: clubMember.Club_Id).FirstOrDefault();
                    }
                }
                return Json(clubMember == null ? new { ok = true } : clubMember.Simplify());
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                clubMember = null;
                person = null;

                toSave?.Clear();
                toSave = null;
            }
        }
    }
}
