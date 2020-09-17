using System.Collections.Generic;
using System.Threading.Tasks;

using GnssDemonstrator.API.Models;

namespace GnssDemonstrator.API.Data
{
    public interface IUserRepository : IGenericRepository
    {
        Task<IEnumerable<User>> GetUsers();
        Task<User> GetUser(int id);
    }
}