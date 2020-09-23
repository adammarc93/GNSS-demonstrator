using System;

using GnssDemonstrator.API.Models;

namespace GnssDemonstrator.API.Dtos
{
    public class UserForUpdateDto
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string Gender { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Description { get; set; }
        public Photo Photo { get; set; }
    }
}