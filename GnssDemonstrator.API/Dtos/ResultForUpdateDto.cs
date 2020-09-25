using System;

namespace GnssDemonstrator.API.Dtos
{
    public class ResultForUpdateDto
    {
        public double Value { get; set; }
        public DateTime Date { get; set; }

        public ResultForUpdateDto()
        {
            Date = DateTime.Now;
        }
    }
}