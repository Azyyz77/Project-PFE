'use client';

import { useForm as useReactHookForm, FieldValues, UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';

interface UseFormOptions<T extends FieldValues> extends Omit<UseFormProps<T>, 'resolver'> {
  schema?: ZodSchema;
}

/**
 * Custom form hook that integrates react-hook-form with zod
 */
export function useForm<T extends FieldValues>({
  schema,
  ...options
}: UseFormOptions<T>) {
  return useReactHookForm<T>({
    ...options,
    resolver: schema ? zodResolver(schema) : undefined,
  });
}
