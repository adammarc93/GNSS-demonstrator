namespace GnssDemonstrator.API.Models
{
    public class Question
    {
        public int Id { get; set; }
        public string Value { get; set; }
        public string Answer { get; set; }

        public Test Test { get; set; }
        public int TestId { get; set; }
    }
}