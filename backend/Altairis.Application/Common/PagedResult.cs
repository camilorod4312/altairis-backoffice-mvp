namespace Altairis.Application.Common;

public sealed record PagedResult<T>(
    int Page,
    int PageSize,
    int Total,
    IReadOnlyList<T> Items);

