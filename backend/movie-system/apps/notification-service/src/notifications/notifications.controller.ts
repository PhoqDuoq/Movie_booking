import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern('PAYMENT_SUCCESS')
  async handlePaymentSuccess(@Payload() data: { bookingId: string }) {
    this.logger.log(`Received PAYMENT_SUCCESS event for booking: ${data.bookingId}`);
    await this.notificationsService.sendTicketEmail(data.bookingId);
  }
}
