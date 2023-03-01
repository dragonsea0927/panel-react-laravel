<?php

namespace Convoy\Services\Nodes;

use Carbon\Carbon;
use Convoy\Models\Node;
use Convoy\Models\Server;
use Convoy\Repositories\Proxmox\Server\ProxmoxMetricsRepository;

class ServerUsagesSyncService
{
    public function __construct(private ProxmoxMetricsRepository $repository)
    {
    }

    public function handle(Node $node)
    {
        $servers = $node->servers;

        $servers->each(function (Server $server) {
            $metrics = $this->repository->setServer($server)->getMetrics('hour');

            $bandwidth = $server->bandwidth_usage;
            $endingDate = $server->hydrated_at ? Carbon::parse($server->hydrated_at) : Carbon::now()->firstOfMonth();

            foreach ($metrics as $metric) {
                if (Carbon::createFromTimestamp($metric['time'])->gt($endingDate)) {
                    // we multiply it by 60 seconds because each metric is
                    // recorded every 1 minute but the values like netin and
                    // netout are in bytes/sec
                    $bandwidth += (int) $metric['netin'] * 60 + (int) $metric['netout'] * 60;
                }
            }

            if ($bandwidth > 0) {
                $server->update([
                    'bandwidth_usage' => $bandwidth,
                    'hydrated_at' => now(),
                ]);
            }
        });
    }
}
