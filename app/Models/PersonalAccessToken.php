<?php

namespace Convoy\Models;

use Convoy\Enums\Api\ApiKeyType;
use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

class PersonalAccessToken extends SanctumPersonalAccessToken
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'type',
        'name',
        'token',
        'abilities',
    ];

    protected $casts = [
        'type' => ApiKeyType::class,
        'abilities' => 'json',
        'last_used_at' => 'datetime',
    ];
}
