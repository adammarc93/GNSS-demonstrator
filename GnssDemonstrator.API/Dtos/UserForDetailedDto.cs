using System;
using System.Collections.Generic;

namespace GnssDemonstrator.API.Dtos
{
    public class UserForDetailedDto
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string Gender { get; set; }
        public int Age { get; set; }
        public string Description { get; set; }
        public DateTime DateOfBirth { get; set; }
        public DateTime Created { get; set; }
        public DateTime LastActive { get; set; }
        public double? BestResult { get; set; }
        public double? AverageResult { get; set; }
        public List<ResultForDetailedDto> Results { get; set; }
        public PhotoForDetailedDto Photo { get; set; }
    }
}