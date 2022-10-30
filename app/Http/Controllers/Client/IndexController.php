<?php

namespace Convoy\Http\Controllers\Client;

use Convoy\Http\Controllers\ApplicationApiController;
use Convoy\Models\Server;
use Convoy\Transformers\Client\ServerTransformer;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\QueryBuilder;

class IndexController extends ApplicationApiController
{
    public function index(Request $request)
    {
        $user = $request->user();

        $builder = QueryBuilder::for(Server::query())
            ->with(['addresses', 'template'])
            ->allowedFilters(['name']);

        $type = $request->input('type');

        if ($type === 'all') {
            if (!$user->root_admin) {
                $builder = $builder->whereRaw('1 = 2');
            }
        } else {
            $builder = $builder->where('servers.user_id', $user->id);
        }

        $servers = $builder->paginate(min($request->query('per_page', 50), 100))->appends($request->query());

        return fractal($servers, new ServerTransformer)->respond();
    }

    public function verifyAuthState()
    {
        return $this->returnContent(['authenticated' => true]);
    }
}
