<?php

namespace App\Services\Servers;

use App\Services\ProxmoxService;

class NetworkService extends ProxmoxService
{
    public function getIpSets()
    {
        return $this->removeDataProperty($this->instance()->firewall()->ipSet()->get());
    }

    public function getLockedIps(string $ipSetName)
    {
        return $this->removeDataProperty($this->instance()->firewall()->ipSet()->name($ipSetName)->get());
    }

    public function createIpSet(string $name, string $comments = 'Generated by Convoy')
    {
        return $this->instance()->firewall()->ipSet()->post([
            'name' => $name,
            'comment' => $comments,
        ]);
    }

    public function deleteIpSet(string $name)
    {
        $addresses = array_column($this->getLockedIps($name), 'cidr');

        foreach ($addresses as $address)
        {
            $this->unlockIp($name, $address);
        }

        return $this->instance()->firewall()->ipSet()->name($name)->delete();
    }

    public function clearIpSets()
    {
        $ipSets = array_column($this->getIpSets(), 'name');

        foreach ($ipSets as $ipSet)
        {
            $this->deleteIpSet($ipSet);
        }
    }

    public function lockIp(string $ipSetName, string $address, string $comments = 'Generated by Convoy', bool $noMatch = false)
    {
        return $this->removeDataProperty($this->instance()->firewall()->ipSet()->name($ipSetName)->post([
            'cidr' => $address,
            'nomatch' => $noMatch,
            'comment' => $comments,
        ]));
    }

    public function lockIps(array $addresses, string $ipSetName = 'default')
    {
        $this->createIpSet($ipSetName);

        foreach ($addresses as $address)
        {
            $this->lockIp($ipSetName, $address);
        }
    }

    public function unlockIp(string $ipSetName, string $address)
    {
        return $this->instance()->firewall()->ipSet()->name($ipSetName)->cidr($address)->delete();
    }
}