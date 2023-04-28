<?php

use Convoy\Http\Controllers\Client;
use Convoy\Http\Middleware\Activity\ServerSubject;
use Convoy\Http\Middleware\Client\Server\AuthenticateServerAccess;
use Illuminate\Support\Facades\Route;

Route::get('/servers', [Client\IndexController::class, 'index']);

Route::prefix('/servers/{server}')->middleware(ServerSubject::class, AuthenticateServerAccess::class)->group(function () {
    Route::get('/', [Client\Servers\ServerController::class, 'index'])->name('servers.show');
    Route::get('/details', [Client\Servers\ServerController::class, 'details']);

    Route::get('/state', [Client\Servers\ServerController::class, 'getState']);
    Route::patch('/state', [Client\Servers\ServerController::class, 'updateState']);

    Route::get('/terminal', [Client\Servers\ServerController::class, 'authorizeTerminal']);

    Route::prefix('/backups')->group(function () {
        Route::get('/', [Client\Servers\BackupController::class, 'index']);
        Route::post('/', [Client\Servers\BackupController::class, 'store']);
        Route::post('/{backup}/restore', [Client\Servers\BackupController::class, 'restore']);
        Route::delete('/{backup}', [Client\Servers\BackupController::class, 'destroy']);
    });

    Route::prefix('/settings')->group(function () {
        Route::post('/rename', [Client\Servers\SettingsController::class, 'rename']);
        Route::get('/template-groups', [Client\Servers\SettingsController::class, 'getTemplateGroups']);
        Route::post('/reinstall', [Client\Servers\SettingsController::class, 'reinstall']);

        Route::get('/hardware/boot-order', [Client\Servers\SettingsController::class, 'getBootOrder']);
        Route::put('/hardware/boot-order', [Client\Servers\SettingsController::class, 'updateBootOrder']);

        Route::get('/hardware/isos', [Client\Servers\SettingsController::class, 'getMedia']);
        Route::post('/hardware/isos/{iso}/mount', [Client\Servers\SettingsController::class, 'mountMedia']);
        Route::post('/hardware/isos/{iso}/unmount', [Client\Servers\SettingsController::class, 'unmountMedia']);

        Route::get('/network', [Client\Servers\SettingsController::class, 'getNetwork']);
        Route::put('/network', [Client\Servers\SettingsController::class, 'updateNetwork']);

        Route::get('/security', [Client\Servers\SettingsController::class, 'getSecurity']);
        Route::put('/security', [Client\Servers\SettingsController::class, 'updateSecurity']);
    });
});
