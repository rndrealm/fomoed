<script>
	import { page } from '$app/stores';

	const email = $page.url.searchParams.get('email');
</script>

<div class="flex flex-col items-center text-center">
	<img src="/icons/email-sent.svg" width={70} height={70} alt="Email sent" />

	<h1 class="font-paralucent-demibold text-[30px] -desktop:text-[24px] pt-[24px]">Email Sent</h1>

	<div class="pt-[19px] text-[#FFFFFFCC] -desktop:text-sm -desktop:px-4">
		We've sent you an email at
		<span class="text-white font-extrabold"> {email}</span>
		<br />
		Check your inbox and follow the instructions to create the account.
	</div>

	<!-- <div class="pt-[36px] text-[#FFFFFFCC] -desktop:text-sm">
		Did not receive the email? <button class="text-primary">Resend email</button>
	</div> -->

	<div class="pt-[20px] text-[#FFFFFFCC] -desktop:text-sm">
		Wrong email address?{' '}
		<a href="/auth" class="text-primary">Change Email Address</a>
	</div>
</div>
