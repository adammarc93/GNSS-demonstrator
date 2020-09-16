namespace GnssDemonstrator.API.Dtos
{
    public class UserForListDto
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string Gender { get; set; }
        public int Age { get; set; }
        public double BestResult { get; set; }
        public double AverageResult { get; set; }
        public string PhotoUrl { get; set; }
    }
}