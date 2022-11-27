<?php

namespace Convoy\Http\Controllers\Client\Servers;

use Convoy\Enums\Server\Cloudinit\AuthenticationType;
use Convoy\Http\Controllers\ApplicationApiController;
use Convoy\Http\Requests\Client\Servers\Settings\RenameServerRequest;
use Convoy\Http\Requests\Client\Servers\Settings\UpdateNetworkRequest;
use Convoy\Http\Requests\Client\Servers\Settings\UpdateSecurityRequest;
use Convoy\Models\Server;
use Convoy\Repositories\Proxmox\Server\ProxmoxCloudinitRepository;
use Convoy\Services\Servers\CloudinitService;
use Convoy\Transformers\Client\ServerNetworkTransformer;
use Convoy\Transformers\Client\ServerSecurityTransformer;
use Illuminate\Support\Arr;

class SettingsController extends ApplicationApiController
{
    public function __construct(private CloudinitService $cloudinitService, private ProxmoxCloudinitRepository $repository)
    {

    }

    public function rename(RenameServerRequest $request, Server $server)
    {
        $server->update($request->validated());

        $this->cloudinitService->updateHostname($server, $request->hostname);

        return $this->returnNoContent();
    }

    public function getNetwork(Server $server)
    {
        return fractal()->item([
            'nameservers' => $this->cloudinitService->getNameservers($server),
        ], new ServerNetworkTransformer())->respond();
    }

    public function updateNetwork(UpdateNetworkRequest $request, Server $server)
    {
        $this->cloudinitService->updateNameservers($server, $request->nameservers);

        return $this->returnNoContent();
    }

    public function getSecurity(Server $server)
    {

        return fractal()->item([
            'ssh_keys' => rawurldecode(Arr::get($this->repository->setServer($server)->getConfig(), 'sshkeys')) ?? ''
        ], new ServerSecurityTransformer)->respond();
    }

    public function updateSecurity(UpdateSecurityRequest $request, Server $server)
    {
        if (AuthenticationType::from($request->type) === AuthenticationType::KEY) {
            $this->cloudinitService->setServer($server)->changePassword($request->ssh_keys, AuthenticationType::from($request->type));
        } else {
            $this->cloudinitService->setServer($server)->changePassword($request->password, AuthenticationType::from($request->type));
        }
    }
}
