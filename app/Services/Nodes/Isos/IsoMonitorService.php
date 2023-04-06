<?php

namespace Convoy\Services\Nodes\Isos;

use Carbon\Carbon;
use Closure;
use Convoy\Models\ISO;
use Convoy\Repositories\Proxmox\Server\ProxmoxActivityRepository;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class IsoMonitorService
{
    public function __construct(private ProxmoxActivityRepository $repository)
    {

    }

    public function checkDownloadProgress(ISO $iso, string $upid, ?Closure $callback = null)
    {
        $status = $this->repository->setNode($iso->node)->getStatus($upid);

        if (Arr::get($status, 'status') === 'running') {
            if ($callback) {
                $callback();
            }

            return;
        }

        if (Str::lower(Arr::get($status, 'exitstatus')) === 'ok')
        {
            $iso->update([
                'is_successful' => true,
                'completed_at' => Carbon::now(),
            ]);
        } else {
            $iso->update([
                'is_successful' => false,
                'completed_at' => Carbon::now(),
            ]);
        }
    }
}
