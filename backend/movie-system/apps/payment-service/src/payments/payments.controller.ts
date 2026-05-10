import { Controller, Post, Body, Req, UseGuards, Get, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  async createPayment(
    @Req() req: any,
    @Body('bookingId') bookingId: string,
    @Body('provider') provider: string,
  ) {
    const userId = req.user.userId;
    return this.paymentsService.createPaymentUrl(userId, bookingId, provider);
  }

  // API dành cho Cổng thanh toán gọi về (IPN/Webhook), thường không dùng JWT mà dùng Signature.
  // Trong mô hình này giả lập không cần check auth.
  @Post('webhook')
  async webhook(
    @Body('paymentId') paymentId: string,
    @Body('status') status: string,
  ) {
    return this.paymentsService.processWebhook(paymentId, status);
  }

  // Giao diện giả lập cổng thanh toán (chỉ để xem trên trình duyệt/postman)
  @Get('mock-gateway')
  mockGateway(
    @Query('paymentId') paymentId: string,
    @Query('amount') amount: string,
    @Query('provider') provider: string,
  ) {
    return {
      message: `Bạn đang ở cổng thanh toán ${provider}. Số tiền cần thanh toán là: ${amount} VND.`,
      instruction: `Vui lòng dùng Postman gửi POST request tới /api/payments/webhook với body: { "paymentId": "${paymentId}", "status": "SUCCESS" } để giả lập thanh toán thành công.`,
    };
  }
}
