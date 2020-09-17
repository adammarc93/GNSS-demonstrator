using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.EntityFrameworkCore;

using GnssDemonstrator.API.Models;

namespace GnssDemonstrator.API.Data
{
    public class UserRepository : GenericRepository, IUserRepository
    {
        private DataContext _context;

        public UserRepository(DataContext context) : base(context)
        {
            _context = context;
        }

        public async Task<User> GetUser(int id)
        {
            var user = await _context.Users.Include(r => r.Results).Include(p => p.Photo).FirstOrDefaultAsync(u => u.Id == id);

            return user;
        }

        public async Task<IEnumerable<User>> GetUsers()
        {
            var users = await _context.Users.Include(r => r.Results).Include(p => p.Photo).ToListAsync();

            return users;
        }
    }
}