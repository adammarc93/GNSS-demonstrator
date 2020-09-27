using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.EntityFrameworkCore;

using GnssDemonstrator.API.Models;
using System.Linq;

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
            var user = await _context.Users.Include(r => r.Results).Include(t => t.Tests).Include(p => p.Photo).FirstOrDefaultAsync(u => u.Id == id);

            return user;
        }

        public async Task<IEnumerable<User>> GetUsers()
        {
            var users = await _context.Users.Include(r => r.Results).Include(t => t.Tests).Include(p => p.Photo).ToListAsync();

            return users;
        }

        public async Task<Photo> GetUserPhoto(int id)
        {
            var photo = await _context.Photos.FirstOrDefaultAsync(u => u.Id == id);

            return photo;
        }

        public async Task<IEnumerable<Result>> GetUserResults(int id)
        {
            var results = await _context.Results.Where(u => u.UserId == id).ToListAsync();

            return results;
        }

        public async Task<Result> GetUserResult(int id)
        {
            var result = await _context.Results.FirstOrDefaultAsync(u => u.Id == id);

            return result;
        }

        public async Task<IEnumerable<Test>> GetUserTests(int id)
        {
            var tests = await _context.Tests.Where(u => u.UserId == id).Include(q => q.Questions).ToListAsync();

            return tests;
        }

        public async Task<Test> GetUserTest(int id)
        {
            var test = await _context.Tests.Where(u => u.UserId == id).Include(q => q.Questions).FirstOrDefaultAsync(u => u.Id == id);

            return test;
        }
    }
}