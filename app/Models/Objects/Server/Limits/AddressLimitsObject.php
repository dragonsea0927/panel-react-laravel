<?php

namespace App\Models\Objects\Server\Limits;

use App\Models\Objects\Server\Allocations\Network\AddressObject;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\LaravelData\Attributes\DataCollectionOf;

class AddressLimitsObject extends Data
{
    public function __construct(
        #[DataCollectionOf(AddressObject::class)]
        public DataCollection $ipv4,
        #[DataCollectionOf(AddressObject::class)]
        public DataCollection $ipv6,
    ) {
    }
}