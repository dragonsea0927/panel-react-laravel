<?php

namespace Convoy\Http\Controllers\Client\Servers;

use Convoy\Models\Server;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\QueryBuilder;
use Convoy\Http\Controllers\Controller;
use Convoy\Transformers\Client\ActivityLogTransformer;

class ActivityController extends Controller
{
    public function __invoke(Server $server, Request $request)
    {
        $activity = QueryBuilder::for($server->activity())
            ->with('actor')
            ->allowedSorts(['created_at', 'updated_at'])
            ->allowedFilters(['event', 'batch', 'status'])
            ->paginate(min($request->query('per_page', 25), 100))
            ->appends($request->query());

        return fractal($activity, new ActivityLogTransformer())->respond();
    }
}
