<?php

namespace Convoy\Http\Requests\Coterm;

use Convoy\Enums\Server\ConsoleType;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Foundation\Http\FormRequest;

class StoreSessionRequest extends FormRequest
{
    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', new Enum(ConsoleType::class)],
        ];
    }
}
