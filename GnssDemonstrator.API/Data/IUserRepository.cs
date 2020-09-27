using System.Collections.Generic;
using System.Threading.Tasks;

using GnssDemonstrator.API.Models;

namespace GnssDemonstrator.API.Data
{
    public interface IUserRepository : IGenericRepository
    {
        Task<IEnumerable<User>> GetUsers();
        Task<User> GetUser(int id);
        Task<Photo> GetUserPhoto(int id);
        Task<IEnumerable<Result>> GetUserResults(int id);
        Task<Result> GetUserResult(int id);
        Task<IEnumerable<Test>> GetUserTests(int id);
        Task<Test> GetUserTest(int id);
    }
}