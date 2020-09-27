using System;
using System.Collections.Generic;

using GnssDemonstrator.API.Models;

namespace GnssDemonstrator.API.Dtos
{
    public class TestForUpdateDto
    {
        public DateTime Date { get; set; }
        public List<Question> Questions { get; set; }

        public TestForUpdateDto()
        {
            Date = DateTime.Now;
            Questions = new List<Question>();
        }
    }
}