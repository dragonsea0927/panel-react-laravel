<?php

namespace Convoy\Policies;

use Convoy\Models\Coterm;
use Convoy\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CotermPolicy
{
    use HandlesAuthorization;

    public function delete(User $user, Coterm $coterm): bool
    {
        $coterm->loadCount(['nodes']);

        if ($coterm->nodes_count > 0) {
            $this->deny('Cannot delete an instance of Coterm with nodes attached to it.');
        }

        return true;
    }
}
