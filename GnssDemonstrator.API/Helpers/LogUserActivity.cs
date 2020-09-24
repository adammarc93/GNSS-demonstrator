using System.Security.Claims;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;

using GnssDemonstrator.API.Data;
using System;

namespace GnssDemonstrator.API.Helpers
{
    public class LogUserActivity : IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var resultContext = await next();
            var repository = resultContext.HttpContext.RequestServices.GetService<IUserRepository>();
            var userId = int.Parse(resultContext.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var user = await repository.GetUser(userId);

            user.LastActive = DateTime.Now;
            await repository.SaveAll();
        }
    }
}