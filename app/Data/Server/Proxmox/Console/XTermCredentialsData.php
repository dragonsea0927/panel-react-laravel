<?php

namespace Convoy\Data\Server\Proxmox\Console;

use Spatie\LaravelData\Data;
use Convoy\Enums\Node\Access\RealmType;

class XTermCredentialsData extends Data
{
    public function __construct(
        public int       $port,
        public string    $ticket,
        public string    $username,
        public RealmType $realm_type,
        public string    $pve_auth_cookie,
    )
    {
    }
}
