import { ConfigurationError } from "@pipedream/platform";
import calCom from "../../cal_com.app.mjs";
import locationTypes from "../../common/location-types.mjs";

export default {
  key: "cal_com-create-booking",
  name: "Create Booking",
  description: "Create a new booking. [See the documentation](https://cal.com/docs/api-reference/v2/bookings/create-a-booking)",
  version: "0.0.7",
  annotations: {
    destructiveHint: false,
    openWorldHint: true,
    readOnlyHint: false,
  },
  type: "action",
  props: {
    calCom,
    bookingType: {
      type: "string",
      label: "Booking Type",
      description: "Select the type of booking to create.",
      options: [
        {
          label: "Regular Booking",
          value: "booking",
        },
        {
          label: "Instant Booking (Team)",
          value: "instant",
        },
        {
          label: "Recurring Booking",
          value: "recurring",
        },
      ],
      reloadProps: true,
    },
    // Event type identification — provide eventTypeId OR (eventTypeSlug + username/teamSlug)
    eventTypeId: {
      propDefinition: [
        calCom,
        "eventTypeId",
      ],
    },
    eventTypeSlug: {
      type: "string",
      label: "Event Type Slug",
      description: "Slug of the event type. Use with **Username** or **Team Slug** as an alternative to **Event Type ID**.",
      optional: true,
    },
    username: {
      type: "string",
      label: "Username",
      description: "Username of the individual event owner. Required when using **Event Type Slug** for a personal event type.",
      optional: true,
    },
    teamSlug: {
      type: "string",
      label: "Team Slug",
      description: "Team slug. Required when using **Event Type Slug** for a team event type.",
      optional: true,
    },
    organizationSlug: {
      type: "string",
      label: "Organization Slug",
      description: "Organization slug. Optional when using slug-based event type identification.",
      optional: true,
    },
    // Timing
    start: {
      type: "string",
      label: "Start Time (UTC)",
      description: "Booking start time in ISO 8601 UTC format, e.g. `2024-08-13T09:00:00Z`. Supersedes **Start Time** when both are set.",
    },
    startTime: {
      type: "string",
      label: "Start Time",
      description: "Start time in ISO 8601 UTC format. Use **Start Time (UTC)** for new workflows.",
      optional: true,
    },
    endTime: {
      type: "string",
      label: "End Time",
      description: "Booking end time in ISO 8601 format. Optional — Cal.com derives end time from event type duration by default.",
      optional: true,
    },
    lengthInMinutes: {
      type: "integer",
      label: "Length (Minutes)",
      description: "Override the event type's default duration in minutes.",
      optional: true,
    },
    // Attendee (V2)
    attendeeName: {
      type: "string",
      label: "Attendee Name",
      description: "Full name of the attendee. Supersedes **Name** when both are set.",
    },
    attendeeEmail: {
      type: "string",
      label: "Attendee Email",
      description: "Email address of the attendee. Required unless **Attendee Phone Number** is provided. Supersedes **Email** when both are set.",
    },
    attendeeTimeZone: {
      propDefinition: [
        calCom,
        "timeZone",
      ],
      label: "Attendee Time Zone",
      description: "Time zone of the attendee, e.g. `America/New_York`. Supersedes **Time Zone** when both are set.",
    },
    attendeeLanguage: {
      propDefinition: [
        calCom,
        "language",
      ],
      label: "Attendee Language",
      description: "Language for the booking confirmation. Supersedes **Language** when both are set.",
      optional: true,
    },
    attendeePhoneNumber: {
      type: "string",
      label: "Attendee Phone Number",
      description: "Phone number in international format, e.g. `+919876543210`. Can be used instead of **Attendee Email** as the contact method. Required when the event type has SMS reminders enabled.",
      optional: true,
    },
    // Attendee (legacy — kept for backward compatibility with workflows on v0.0.6)
    name: {
      type: "string",
      label: "Name",
      description: "Attendee full name. Use **Attendee Name** for new workflows.",
      optional: true,
    },
    email: {
      type: "string",
      label: "Email",
      description: "Attendee email address. Use **Attendee Email** for new workflows. Required unless **Attendee Phone Number** is provided.",
      optional: true,
    },
    timeZone: {
      propDefinition: [
        calCom,
        "timeZone",
      ],
      description: "Attendee time zone. Use **Attendee Time Zone** for new workflows.",
      optional: true,
    },
    language: {
      propDefinition: [
        calCom,
        "language",
      ],
      description: "Booking confirmation language. Use **Attendee Language** for new workflows.",
      optional: true,
    },
    // Booking details
    title: {
      type: "string",
      label: "Title",
      description: "Custom title for the booking.",
      optional: true,
    },
    guests: {
      type: "string[]",
      label: "Guests",
      description: "Additional guest email addresses to invite.",
      optional: true,
    },
    location: {
      type: "string",
      label: "Location Type",
      description: "Meeting location type. Select a type to reveal any additional required fields.",
      options: locationTypes.LOCATION_TYPES,
      optional: true,
      reloadProps: true,
    },
    metadata: {
      type: "object",
      label: "Metadata",
      description: "Custom key-value metadata. Max 50 keys; key names ≤ 40 chars, values ≤ 500 chars.",
      optional: true,
    },
    bookingFieldsResponses: {
      type: "object",
      label: "Booking Fields Responses",
      description: "Responses to custom booking form fields. Keys are field slugs, values are the attendee's responses.",
      optional: true,
    },
    // Advanced / host-only
    allowConflicts: {
      type: "boolean",
      label: "Allow Conflicts",
      description: "Bypass availability checks and allow double-booking. Host use only.",
      optional: true,
    },
    allowBookingOutOfBounds: {
      type: "boolean",
      label: "Allow Booking Out of Bounds",
      description: "Allow booking outside the event type's scheduling window. Host use only.",
      optional: true,
    },
    emailVerificationCode: {
      type: "string",
      label: "Email Verification Code",
      description: "Required when the event type has email verification enabled.",
      optional: true,
    },
  },
  async additionalProps() {
    const props = {};

    if (this.bookingType === "recurring") {
      props.recurrenceCount = {
        type: "integer",
        label: "Recurrence Count",
        description: "Number of occurrences for this recurring booking. Cannot exceed the event type's maximum recurrence count. Supersedes **Recurring Count** when both are set.",
        optional: true,
      };
      props.recurringCount = {
        type: "integer",
        label: "Recurring Count",
        description: "Number of recurring occurrences. Use **Recurrence Count** for new workflows.",
        optional: true,
      };
    }

    if (this.location === "attendeeAddress") {
      props.locationAddress = {
        type: "string",
        label: "Address",
        description: "Physical address provided by the attendee.",
      };
    } else if (this.location === "attendeeDefined") {
      props.locationValue = {
        type: "string",
        label: "Location",
        description: "Location string defined by the attendee.",
      };
    } else if (this.location === "attendeePhone") {
      props.locationPhone = {
        type: "string",
        label: "Phone Number",
        description: "Phone number provided by the attendee in international format, e.g. `+919876543210`.",
      };
    } else if (this.location === "integration") {
      props.locationIntegration = {
        type: "string",
        label: "Integration",
        description: "Video conferencing integration to use for this booking.",
        options: locationTypes.INTEGRATION_OPTIONS,
      };
    }

    return props;
  },
  methods: {
    _buildLocation() {
      if (!this.location) return undefined;
      const loc = {
        type: this.location,
      };
      if (this.location === "attendeeAddress") loc.address = this.locationAddress;
      else if (this.location === "attendeeDefined") loc.location = this.locationValue;
      else if (this.location === "attendeePhone") loc.phone = this.locationPhone;
      else if (this.location === "integration") loc.integration = this.locationIntegration;
      return loc;
    },
  },
  async run({ $ }) {
    const resolvedStart = this.start || this.startTime;
    if (!resolvedStart) {
      throw new ConfigurationError("Provide Start Time (UTC) or Start Time.");
    }
    const utcIsoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;
    if (!utcIsoPattern.test(resolvedStart)) {
      throw new ConfigurationError("Start time must be in UTC ISO 8601 format ending with 'Z', e.g. 2024-08-13T09:00:00Z.");
    }

    const resolvedName = this.attendeeName || this.name;
    const resolvedEmail = this.attendeeEmail || this.email;
    const resolvedTimeZone = this.attendeeTimeZone || this.timeZone;
    const resolvedLanguage = this.attendeeLanguage || this.language;
    const resolvedRecurrenceCount = this.recurrenceCount || this.recurringCount;
    const hasSlugIdentifier = this.eventTypeSlug && (this.username || this.teamSlug);
    if (!this.eventTypeId && !hasSlugIdentifier) {
      throw new ConfigurationError("Provide either Event Type ID, or Event Type Slug with Username (individual) or Event Type Slug with Team Slug (team).");
    }

    const data = {
      eventTypeId: this.eventTypeId,
      eventTypeSlug: this.eventTypeSlug,
      username: this.username,
      teamSlug: this.teamSlug,
      organizationSlug: this.organizationSlug,
      start: resolvedStart,
      endTime: this.endTime,
      lengthInMinutes: this.lengthInMinutes,
      attendee: {
        name: resolvedName,
        email: resolvedEmail,
        timeZone: resolvedTimeZone,
        ...(resolvedLanguage && {
          language: resolvedLanguage,
        }),
        ...(this.attendeePhoneNumber && {
          phoneNumber: this.attendeePhoneNumber,
        }),
      },
      title: this.title,
      guests: this.guests,
      location: this._buildLocation(),
      metadata: this.metadata,
      bookingFieldsResponses: this.bookingFieldsResponses,
      allowConflicts: this.allowConflicts,
      allowBookingOutOfBounds: this.allowBookingOutOfBounds,
      emailVerificationCode: this.emailVerificationCode,
      ...(this.bookingType === "instant" && {
        instant: true,
      }),
      ...(this.bookingType === "recurring" && {
        recurrenceCount: resolvedRecurrenceCount,
      }),
    };

    const response = await this.calCom.createBooking({
      data,
      $,
    });
    const bookingUid = response?.data?.uid;
    $.export(
      "$summary",
      bookingUid
        ? `Successfully created booking with UID: ${bookingUid}`
        : "Successfully created booking",
    );
    return response;
  },
};
