using System.Threading.Tasks;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using GnssDemonstrator.API.Data;
using GnssDemonstrator.API.Models;

namespace GnssDemonstrator.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ValuesController : ControllerBase
    {
        private DataContext _context;

        public ValuesController(DataContext context)
        {
            _context = context;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetValues()
        {
            var values = await _context.Values.ToListAsync();

            return Ok(values);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetValue(int id)
        {
            var value = await _context.Values.FirstOrDefaultAsync(x => x.Id == id);

            return Ok(value);
        }

        [HttpPost]
        public async Task<IActionResult> AddValue([FromBody] Value value)
        {
            _context.Values.Add(value);
            await _context.SaveChangesAsync();

            return Ok(value);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> EditValue(int id, [FromBody] Value value)
        {
            var data = await _context.Values.FindAsync(id);

            if (data == null)
            {
                return NoContent();
            }

            data.Name = value.Name;
            _context.Values.Update(data);
            await _context.SaveChangesAsync();

            return Ok(data);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteValue(int id)
        {
            var data = await _context.Values.FindAsync(id);

            if (data == null)
            {
                return NoContent();
            }

            _context.Values.Remove(data);
            await _context.SaveChangesAsync();

            return Ok(data);
        }
    }
}