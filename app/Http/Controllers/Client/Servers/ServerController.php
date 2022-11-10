<?php

namespace Convoy\Http\Controllers\Client\Servers;

use Convoy\Http\Controllers\ApplicationApiController;
use Convoy\Http\Requests\Client\Servers\SendPowerCommandRequest;
use Convoy\Models\Server;
use Convoy\Repositories\Proxmox\Server\ProxmoxPowerRepository;
use Convoy\Repositories\Proxmox\Server\ProxmoxServerRepository;
use Convoy\Services\Servers\ServerDetailService;
use Convoy\Services\Servers\VncService;
use Convoy\Transformers\Client\ServerStatusTransformer;
use Convoy\Transformers\Client\ServerTerminalTransformer;
use Convoy\Transformers\Client\ServerTransformer;

class ServerController extends ApplicationApiController
{
    public function __construct(private VncService $vncService, private ServerDetailService $detailService, private ProxmoxServerRepository $serverRepository, private ProxmoxPowerRepository $powerRepository)
    {
    }

    public function index(Server $server)
    {
        return fractal($this->detailService->getByEloquent($server), new ServerTransformer)->respond();
    }

    public function getStatus(Server $server)
    {
        return fractal()->item($this->serverRepository->setServer($server)->getStatus(), new ServerStatusTransformer)->respond();
    }

    public function sendPowerCommand(Server $server, SendPowerCommandRequest $request)
    {
        $this->powerRepository->setServer($server);

        switch ($request->state) {
            case 'start':
                $this->powerRepository->send('start');
                break;
            case 'restart':
                $this->powerRepository->send('reboot');
                break;
            case 'kill':
                $this->powerRepository->send('stop');
                break;
            case 'shutdown':
                $this->powerRepository->send('shutdown');
                break;
        }

        return $this->returnNoContent();
    }

    public function authorizeTerminal(Server $server)
    {
        $data = $this->vncService->generateCredentials($server);

        return fractal()->item([
            'token' => $data,
            'node' => $server->node->cluster,
            'vmid' => $server->vmid,
            'hostname' => $server->node->hostname,
            'port' => $server->node->port,
        ], new ServerTerminalTransformer)->respond();
    }
}
