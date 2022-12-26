<?php

namespace Convoy\Http\Requests\Admin\Nodes\Templates;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateGroupOrderRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'order' => 'required|array',
            'order.*' => 'required|integer|exists:template_groups,id',
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
