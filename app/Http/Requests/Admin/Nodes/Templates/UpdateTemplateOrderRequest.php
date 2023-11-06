<?php

namespace Convoy\Http\Requests\Admin\Nodes\Templates;

use Illuminate\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTemplateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order' => 'required|array',
            'order.*' => 'required|integer|exists:templates,id',
        ];
    }

    public function withValidator(Validator $validator)
    {
        // validate if each order id is unique in the array
        $validator->after(function ($validator) {
            if (count($this->order) !== count(array_unique($this->order))) {
                $validator->errors()->add('order', 'Duplicate order id');
            }
        });
    }
}
