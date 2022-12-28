<?php

use Convoy\Http\Controllers\Client;
use Convoy\Http\Middleware\Activity\ServerSubject;
use Convoy\Http\Middleware\Client\Server\AuthenticateServerAccess;
use Illuminate\Support\Facades\Route;

Route::get('/servers', [Client\IndexController::class, 'index']);

Route::group([
    'prefix' => '/servers/{server}',
    'middleware' => [
        ServerSubject::class,
        AuthenticateServerAccess::class,
    ],
], function () {
    Route::get('/', [Client\Servers\ServerController::class, 'index'])->name('api:client:servers.show');
    Route::get('/details', [Client\Servers\ServerController::class, 'details']);

    Route::get('/status', [Client\Servers\ServerController::class, 'getStatus']);
    Route::post('/status', [Client\Servers\ServerController::class, 'sendPowerCommand']);

    Route::get('/terminal', [Client\Servers\ServerController::class, 'authorizeTerminal']);

    Route::prefix('/backups')->group(function () {
        Route::get('/', [Client\Servers\BackupController::class, 'index']);
        Route::post('/', [Client\Servers\BackupController::class, 'store']);
        Route::post('/{backup}/restore', [Client\Servers\BackupController::class, 'restore']);
        Route::delete('/{backup}', [Client\Servers\BackupController::class, 'destroy']);
    });

    Route::group(['prefix' => '/settings'], function () {
        Route::post('/rename', [Client\Servers\SettingsController::class, 'rename']);

        Route::get('/hardware/boot-order', [Client\Servers\SettingsController::class, 'getBootOrder']);
        Route::put('/hardware/boot-order', [Client\Servers\SettingsController::class, 'updateBootOrder']);

        Route::get('/network', [Client\Servers\SettingsController::class, 'getNetwork']);
        Route::put('/network', [Client\Servers\SettingsController::class, 'updateNetwork']);

        Route::get('/security', [Client\Servers\SettingsController::class, 'getSecurity']);
        Route::put('/security', [Client\Servers\SettingsController::class, 'updateSecurity']);
    });
});