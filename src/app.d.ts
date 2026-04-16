import type pino from 'pino';

declare global {
	namespace App {
		interface Locals {
			logger: pino.Logger;
		}
	}
}

export {};
