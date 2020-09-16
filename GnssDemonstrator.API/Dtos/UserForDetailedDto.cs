using System;
using System.Collections.Generic;

using GnssDemonstrator.API.Models;

namespace GnssDemonstrator.API.Dtos
{
    public class UserForDetailedDto
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string Gender { get; set; }
        public int Age { get; set; }
        public DateTime Created { get; set; }
        public DateTime LastActive { get; set; }
        public List<Result> Results { get; set; }
        public string Description { get; set; }
        public Photo Photo { get; set; }
    }
}